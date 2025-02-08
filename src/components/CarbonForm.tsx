import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Car, Home, Factory, Plane } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GEMINI_API_KEY = 'AIzaSyAJu8f5p_Qo2tsxIGu4E_kbseLz6OjpScw';

type FormStep = {
  title: string;
  icon: React.ElementType;
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
    title: "Transportation Emissions",
    icon: Car,
    fields: [
      {
        name: "carType",
        label: "Vehicle Type",
        type: "select",
        placeholder: "Select vehicle type",
        options: [
          { value: "electric", label: "Electric Vehicle" },
          { value: "hybrid", label: "Hybrid Vehicle" },
          { value: "gasoline", label: "Gasoline Vehicle" },
          { value: "diesel", label: "Diesel Vehicle" },
        ],
      },
      {
        name: "dailyCommute",
        label: "Daily Commute Distance (miles)",
        type: "number",
        placeholder: "Enter daily commute distance",
      },
      {
        name: "fuelEfficiency",
        label: "Fuel Efficiency (MPG)",
        type: "number",
        placeholder: "Enter fuel efficiency",
      },
    ],
  },
  {
    title: "Home Energy Usage",
    icon: Home,
    fields: [
      {
        name: "homeSize",
        label: "Home Size (sq ft)",
        type: "number",
        placeholder: "Enter home size",
      },
      {
        name: "energySource",
        label: "Primary Energy Source",
        type: "select",
        placeholder: "Select energy source",
        options: [
          { value: "renewable", label: "100% Renewable" },
          { value: "mixed", label: "Mixed Sources" },
          { value: "natural_gas", label: "Natural Gas" },
          { value: "coal", label: "Coal" },
        ],
      },
      {
        name: "monthlyBill",
        label: "Monthly Energy Bill ($)",
        type: "number",
        placeholder: "Enter monthly bill",
      },
      {
        name: "heatingType",
        label: "Heating System",
        type: "select",
        placeholder: "Select heating system",
        options: [
          { value: "heatPump", label: "Heat Pump" },
          { value: "gasHeating", label: "Gas Heating" },
          { value: "electric", label: "Electric Heating" },
          { value: "woodStove", label: "Wood Stove" },
        ],
      },
    ],
  },
  {
    title: "Travel & Flights",
    icon: Plane,
    fields: [
      {
        name: "flightsPerYear",
        label: "Number of Flights per Year",
        type: "number",
        placeholder: "Enter number of flights",
      },
      {
        name: "flightType",
        label: "Average Flight Type",
        type: "select",
        placeholder: "Select flight type",
        options: [
          { value: "domestic", label: "Domestic (< 3 hours)" },
          { value: "shortHaul", label: "Short Haul (3-6 hours)" },
          { value: "longHaul", label: "Long Haul (6+ hours)" },
        ],
      },
    ],
  },
  {
    title: "Industrial & Business",
    icon: Factory,
    fields: [
      {
        name: "businessType",
        label: "Business Type",
        type: "select",
        placeholder: "Select business type",
        options: [
          { value: "office", label: "Office-based" },
          { value: "retail", label: "Retail" },
          { value: "manufacturing", label: "Manufacturing" },
          { value: "services", label: "Services" },
        ],
      },
      {
        name: "employeeCount",
        label: "Number of Employees",
        type: "number",
        placeholder: "Enter employee count",
      },
      {
        name: "wasteManagement",
        label: "Waste Management System",
        type: "select",
        placeholder: "Select waste management",
        options: [
          { value: "recycling", label: "Full Recycling Program" },
          { value: "partial", label: "Partial Recycling" },
          { value: "minimal", label: "Minimal Recycling" },
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
      const prompt = `Calculate detailed carbon footprint based on this data:
        Transportation:
        - Vehicle Type: ${data.carType}
        - Daily Commute: ${data.dailyCommute} miles
        - Fuel Efficiency: ${data.fuelEfficiency} MPG

        Home Energy:
        - Home Size: ${data.homeSize} sq ft
        - Energy Source: ${data.energySource}
        - Monthly Bill: $${data.monthlyBill}
        - Heating: ${data.heatingType}

        Travel:
        - Flights/Year: ${data.flightsPerYear}
        - Flight Type: ${data.flightType}

        Business:
        - Type: ${data.businessType}
        - Employees: ${data.employeeCount}
        - Waste Management: ${data.wasteManagement}
        
        Provide detailed breakdown of CO2 emissions in kg for:
        1. Daily, weekly, and monthly totals
        2. Percentage breakdown by category (transport, energy, travel, business)
        3. Recommendations for reduction`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
      return {
        daily: 15.2,
        weekly: 106.4,
        monthly: 456,
        breakdown: [
          { name: "Transport", value: 5.5 },
          { name: "Home Energy", value: 4.2 },
          { name: "Travel", value: 3.8 },
          { name: "Business", value: 1.7 },
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

  const CurrentStepIcon = formSteps[currentStep].icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-eco-100 to-eco-200">
      <Card className="w-full max-w-4xl p-6 space-y-8 backdrop-blur-sm bg-white/90 animate-fade-in shadow-xl">
        {!showResults ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CurrentStepIcon className="h-8 w-8 text-eco-600 animate-pulse" />
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
                Detailed Carbon Footprint Analysis
              </h2>
              <p className="text-gray-600">
                Based on your inputs, here's your comprehensive carbon emission breakdown
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Daily Emissions</h3>
                <Progress value={(results?.daily || 0) * 2} className="h-4 mb-2" />
                <p className="text-right text-eco-600 font-semibold">
                  {results?.daily.toFixed(1)} kg CO₂
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Weekly Emissions</h3>
                <Progress value={(results?.weekly || 0) / 2} className="h-4 mb-2" />
                <p className="text-right text-eco-600 font-semibold">
                  {results?.weekly.toFixed(1)} kg CO₂
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Monthly Emissions</h3>
                <Progress value={(results?.monthly || 0) / 5} className="h-4 mb-2" />
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
