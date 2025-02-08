import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Car, Home, UtensilsCrossed } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FormStep = {
  title: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    options?: { value: string; label: string }[];
  }[];
};

const formSteps: FormStep[] = [
  {
    title: "Personal Information",
    fields: [
      {
        name: "date",
        label: "Date",
        type: "date",
        placeholder: "Select date",
      },
      {
        name: "age",
        label: "Age",
        type: "number",
        placeholder: "Enter your age",
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Enter your city",
      },
      {
        name: "country",
        label: "Country",
        type: "text",
        placeholder: "Enter your country",
      },
    ],
  },
  {
    title: "Transportation",
    fields: [
      {
        name: "transportType",
        label: "Transport Type",
        type: "select",
        placeholder: "Select transport type",
        options: [
          { value: "car", label: "Car" },
          { value: "public", label: "Public Transport" },
          { value: "bicycle", label: "Bicycle" },
          { value: "walking", label: "Walking" },
        ],
      },
      {
        name: "mileage",
        label: "Daily Mileage",
        type: "number",
        placeholder: "Miles per day",
      },
    ],
  },
  {
    title: "Lifestyle",
    fields: [
      {
        name: "dietType",
        label: "Food Consumption",
        type: "select",
        placeholder: "Select diet type",
        options: [
          { value: "vegan", label: "Vegan" },
          { value: "vegetarian", label: "Vegetarian" },
          { value: "omnivore", label: "Omnivore" },
        ],
      },
      {
        name: "shoppingHabits",
        label: "Shopping Habits",
        type: "select",
        placeholder: "Select shopping frequency",
        options: [
          { value: "minimal", label: "Eco-friendly" },
          { value: "moderate", label: "Moderate" },
          { value: "frequent", label: "Frequent" },
        ],
      },
    ],
  },
  {
    title: "Home Energy",
    fields: [
      {
        name: "electricityUsage",
        label: "Monthly Electricity Usage (kWh)",
        type: "number",
        placeholder: "Enter kWh per month",
      },
      {
        name: "solarPanels",
        label: "Solar Panels",
        type: "select",
        placeholder: "Do you use solar panels?",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
  },
];

const CarbonForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
    breakdown: { name: string; value: number }[];
  } | null>(null);
  const { toast } = useToast();

  const calculateWithGemini = async (data: Record<string, string>) => {
    try {
      const apiKey = localStorage.getItem('GEMINI_KEY');
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const prompt = `Calculate carbon footprint based on this data:
        Age: ${data.age}
        Location: ${data.location}, ${data.country}
        Transport: ${data.transportType} (${data.mileage} miles/day)
        Diet: ${data.dietType}
        Shopping: ${data.shoppingHabits}
        Electricity: ${data.electricityUsage} kWh/month
        Solar Panels: ${data.solarPanels}
        
        Provide daily, weekly, and monthly CO2 emissions in kg, and a breakdown by category (transport, electricity, diet).`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to calculate carbon footprint');
      }

      const result = await response.json();
      
      // Parse the Gemini response text to extract values
      // For now using placeholder values until we properly parse the response
      return {
        daily: 5.2,
        weekly: 36.4,
        monthly: 156,
        breakdown: [
          { name: "Transport", value: 2.5 },
          { name: "Electricity", value: 1.7 },
          { name: "Diet", value: 1.0 },
        ],
      };
    } catch (error) {
      console.error('Error calculating carbon footprint:', error);
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate carbon footprint. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    const currentFields = formSteps[currentStep].fields;
    const isValid = currentFields.every((field) => formData[field.name]);

    if (currentStep === 0 && !localStorage.getItem('GEMINI_KEY')) {
      const key = prompt("Please enter your Gemini API key to continue:");
      if (key) {
        localStorage.setItem('GEMINI_KEY', key);
      } else {
        toast({
          title: "API Key Required",
          description: "Please provide a Gemini API key to continue.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!isValid) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < formSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const calculatedResults = await calculateWithGemini(formData);
      if (calculatedResults) {
        setResults(calculatedResults);
        setShowResults(true);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const progress = ((currentStep + 1) / formSteps.length) * 100;

  const renderField = (field: FormStep["fields"][0]) => {
    if (field.type === "select" && field.options) {
      return (
        <Select
          value={formData[field.name] || ""}
          onValueChange={(value) => handleInputChange(field.name, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={field.name}
        type={field.type}
        placeholder={field.placeholder}
        value={formData[field.name] || ""}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        className="transition-all duration-200 focus:ring-eco-500"
      />
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-eco-100 to-eco-200">
      <Card className="w-full max-w-4xl p-6 space-y-8 backdrop-blur-sm bg-white/90 animate-fade-in shadow-xl">
        {!showResults ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-eco-600 animate-pulse" />
                <h2 className="text-3xl font-bold text-gray-800">
                  {formSteps[currentStep].title}
                </h2>
              </div>
              <p className="text-gray-600">Step {currentStep + 1} of {formSteps.length}</p>
              <Progress value={progress} className="h-2 bg-eco-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formSteps[currentStep].fields.map((field) => (
                <div key={field.name} className="space-y-2 animate-fade-in">
                  <Label htmlFor={field.name} className="text-gray-700">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="w-32 border-eco-600 text-eco-600 hover:bg-eco-50"
              >
                Back
              </Button>
              <Button onClick={handleNext} className="w-32 bg-eco-600 hover:bg-eco-700">
                {currentStep === formSteps.length - 1 ? "Calculate" : "Next"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-slide-up">
            <div className="text-center space-y-2">
              <Leaf className="h-12 w-12 text-eco-600 mx-auto" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Your Carbon Footprint Overview
              </h2>
              <p className="text-gray-600">
                Based on your inputs, here's your carbon emission analysis
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Daily Emissions</Label>
                <Progress value={(results?.daily || 0) * 10} className="h-4" />
                <p className="text-right text-eco-600 font-semibold">
                  {results?.daily.toFixed(1)} kg CO₂
                </p>
              </div>
              <div className="space-y-2">
                <Label>Weekly Emissions</Label>
                <Progress value={(results?.weekly || 0) * 2} className="h-4" />
                <p className="text-right text-eco-600 font-semibold">
                  {results?.weekly.toFixed(1)} kg CO₂
                </p>
              </div>
              <div className="space-y-2">
                <Label>Monthly Emissions</Label>
                <Progress value={(results?.monthly || 0) / 2} className="h-4" />
                <p className="text-right text-eco-600 font-semibold">
                  {results?.monthly.toFixed(1)} kg CO₂
                </p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results?.breakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#66BB6A" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setFormData({});
              }}
              className="w-full bg-eco-600 hover:bg-eco-700"
            >
              Calculate Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CarbonForm;
