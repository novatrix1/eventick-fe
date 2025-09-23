import { RegisterFormData } from '@/types';
import { useState } from 'react';

export const useRegisterForm = (initialState: RegisterFormData) => {
  const [formData, setFormData] = useState<RegisterFormData>(initialState);

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    handleInputChange,
    resetForm,
    setFormData
  };
};