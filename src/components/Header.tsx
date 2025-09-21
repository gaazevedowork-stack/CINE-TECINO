import { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Cinema Management System
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sistema de Gestão de Cinemas
          </p>
        </div>
        <div>
          {children}
        </div>
      </div>
    </header>
  );
}
