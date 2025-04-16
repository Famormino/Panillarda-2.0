import Title from "./components/Title";
import DateSelector from "./components/DateSelector";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
    return (
        <div>
            <div className="min-h-screen flex flex-col items-center justify-start bg-gray-200 p-8">
                <Title text="Planilla de Asistencia" />
                <div className="w-full ">
                    <Toaster position="top-right" />
                    <DateSelector />
                </div>
            </div>
        </div>
    );
};

export default App;
