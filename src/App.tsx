import Title from "./components/Title";
import DateSelector from "./components/DateSelector";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
    return (
        <div>
            <div className="min-h-screen flex flex-col bg-gray-200 p-12 dark:bg-gray-900">
                <div className="w-full ">
                    <Title text="Planilla de Asistencia" />
                    <Toaster position="top-right" />
                    <DateSelector />
                </div>
            </div>
        </div>
    );
};

export default App;
