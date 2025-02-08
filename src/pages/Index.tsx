
import CarbonForm from "@/components/CarbonForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-100 to-eco-200">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Calculate Your Carbon Footprint
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Understand your environmental impact and discover ways to reduce your carbon footprint
          </p>
        </div>
        <CarbonForm />
      </div>
    </div>
  );
};

export default Index;
