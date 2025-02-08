
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Leaf, ChevronRight, ChevronLeft } from "lucide-react";

type FormStep = {
  title: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
};

const formSteps: FormStep[] = [
  {
    title: "Personal Information",
    fields: [
      {
        name: "name",
        label: "Full Name",
        type: "text",
        placeholder: "Enter your full name",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter your email",
      },
    ],
  },
  {
    title: "Transportation",
    fields: [
      {
        name: "carMileage",
        label: "Weekly Car Mileage",
        type: "number",
        placeholder: "Miles driven per week",
      },
      {
        name: "publicTransport",
        label: "Public Transport Usage (hours/week)",
        type: "number",
        placeholder: "Hours per week",
      },
    ],
  },
  {
    title: "Home Energy",
    fields: [
      {
        name: "electricity",
        label: "Monthly Electricity Usage (kWh)",
        type: "number",
        placeholder: "kWh per month",
      },
      {
        name: "gasUsage",
        label: "Monthly Gas Usage (therms)",
        type: "number",
        placeholder: "Therms per month",
      },
    ],
  },
];

const CarbonForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [carbonFootprint, setCarbonFootprint] = useState<number | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
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
      calculateCarbonFootprint();
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const calculateCarbonFootprint = async () => {
    // This is where we'll integrate the Gemini API
    // For now, using a placeholder calculation
    const mockCalculation = Math.random() * 10 + 5;
    setCarbonFootprint(mockCalculation);
    setShowResults(true);
  };

  const progress = ((currentStep + 1) / formSteps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-eco-100 to-eco-200">
      <Card className="w-full max-w-lg p-6 space-y-8 backdrop-blur-sm bg-white/80 animate-fade-in">
        {!showResults ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-eco-600" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  {formSteps[currentStep].title}
                </h2>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-6">
              {formSteps[currentStep].fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="transition-all duration-200 focus:ring-eco-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="w-32"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} className="w-32 bg-eco-600 hover:bg-eco-700">
                {currentStep === formSteps.length - 1 ? "Calculate" : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <Leaf className="h-12 w-12 text-eco-600 mx-auto" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Your Carbon Footprint
              </h2>
              <p className="text-gray-600">
                Based on your inputs, here's your estimated annual carbon footprint:
              </p>
            </div>

            <div className="text-center">
              <span className="text-4xl font-bold text-eco-600">
                {carbonFootprint?.toFixed(2)}
              </span>
              <span className="text-xl text-gray-600 ml-2">tonnes CO2e/year</span>
            </div>

            <Progress
              value={(carbonFootprint || 0) * 5}
              className="h-4 rounded-full"
            />

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
