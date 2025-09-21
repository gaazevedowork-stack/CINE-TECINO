import { useState } from "react";

interface LoginFormProps {
  onLogin?: (success: boolean) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError("");

    // Simple password check - in a real app this would be more secure
    setTimeout(() => {
      if (password === "admin123") {
        onLogin?.(true);
      } else {
        setError("Senha incorreta");
      }
      setIsChecking(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mb-4">
            <span className="text-2xl">🎬</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Cinema Dashboard</h1>
          <p className="text-gray-600">Digite a senha para acessar o painel administrativo</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={isChecking || password.length < 3}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
            >
              {isChecking ? "Verificando..." : "Acessar Dashboard"}
            </button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Senha padrão: admin123
          </div>
        </div>
      </div>
    </div>
  );
}
