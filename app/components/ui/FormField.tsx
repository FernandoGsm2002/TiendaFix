'use client'

import { Input, Textarea, Select, SelectItem } from '@heroui/react'
import { formColors } from '@/lib/utils/colors'
import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'time'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  helpText?: string
  disabled?: boolean
  options?: { value: string; label: string }[]
  rows?: number
  startContent?: ReactNode
  endContent?: ReactNode
  className?: string
  min?: string | number
  max?: string | number
  step?: string | number
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  options = [],
  rows = 3,
  startContent,
  endContent,
  className = '',
  min,
  max,
  step
}: FormFieldProps) {
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <Textarea
          name={name}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          isRequired={required}
          isDisabled={disabled}
          isInvalid={!!error}
          errorMessage={error}
          description={helpText}
          minRows={rows}
          variant="bordered"
          size="md"
          classNames={{
            input: "text-gray-900 dark:text-gray-100 text-base",
            inputWrapper: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
            label: "text-gray-800 dark:text-gray-200 font-medium text-base",
            description: "text-gray-600 dark:text-gray-400",
            errorMessage: "text-red-700 dark:text-red-400 font-medium"
          }}
          className={className}
        />
      )
    }

    if (type === 'select' && options.length > 0) {
      const currentValue = String(value).trim();
      const hasValue = currentValue !== '';
      const selectedOption = options.find(opt => opt.value === currentValue);
      
      console.log('FormField Select Debug:', {
        name,
        value,
        currentValue,
        hasValue,
        selectedOption,
        options: options.slice(0, 3) // Solo primeras 3 para no llenar console
      });

      return (
        <Select
          name={name}
          selectedKeys={hasValue ? [currentValue] : []}
          onSelectionChange={(keys) => {
            const selectedValue = Array.from(keys)[0] as string
            console.log('Selection changed:', selectedValue);
            onChange(selectedValue || '')
          }}
          placeholder={placeholder}
          isRequired={required}
          isDisabled={disabled}
          isInvalid={!!error}
          errorMessage={error}
          description={helpText}
          variant="bordered"
          size="md"
          color="primary"
          classNames={{
            trigger: [
              "bg-white dark:bg-gray-800",
              "border-gray-300 dark:border-gray-600",
              "text-gray-900 dark:text-gray-100",
              "data-[open=true]:border-primary-500",
              "data-[focus=true]:border-primary-500",
              "data-[hover=true]:border-primary-400",
              "transition-colors",
              "min-h-12"
            ].join(" "),
            value: [
              "text-gray-900 dark:text-gray-100",
              "font-medium",
              "text-base",
              hasValue ? "text-primary-700 dark:text-primary-300" : "text-gray-500 dark:text-gray-400"
            ].join(" "),
            label: "text-gray-800 dark:text-gray-200 font-medium text-base",
            description: "text-gray-600 dark:text-gray-400",
            errorMessage: "text-red-700 dark:text-red-400 font-medium",
            popoverContent: [
              "bg-white dark:bg-gray-800",
              "border-gray-200 dark:border-gray-600",
              "shadow-lg"
            ].join(" "),
            listbox: "bg-white dark:bg-gray-800",
            selectorIcon: "text-primary-500"
          }}
          className={className}
        >
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              className="text-gray-900 dark:text-gray-100 data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-900 data-[selected=true]:text-primary-700 dark:data-[selected=true]:text-primary-300 data-[hover=true]:bg-primary-100 dark:data-[hover=true]:bg-primary-800 data-[focus=true]:bg-primary-100 dark:data-[focus=true]:bg-primary-800"
              textValue={option.label}
            >
              <span className="font-medium">{option.label}</span>
            </SelectItem>
          ))}
        </Select>
      )
    }

    const inputProps: any = {
      name,
      type,
      value: String(value),
      onChange: (e: any) => onChange(e.target.value),
      placeholder,
      isRequired: required,
      isDisabled: disabled,
      isInvalid: !!error,
      errorMessage: error,
      description: helpText,
      startContent,
      endContent,
      size: "md" as const,
      variant: "bordered" as const,
      classNames: {
        input: "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base",
        inputWrapper: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-12",
        label: "text-gray-800 dark:text-gray-200 font-medium text-base",
        description: "text-gray-600 dark:text-gray-400",
        errorMessage: "text-red-700 dark:text-red-400 font-medium"
      },
      className
    }

    if (type === 'number') {
      if (min !== undefined) inputProps.min = min
      if (max !== undefined) inputProps.max = max
      if (step !== undefined) inputProps.step = step
    }

    if (type === 'date' || type === 'datetime-local' || type === 'time') {
      if (min !== undefined) inputProps.min = min
      if (max !== undefined) inputProps.max = max
    }

    return <Input {...inputProps} />
  }

  return (
    <div className="space-y-2">
      <label className={`block text-base font-medium text-gray-700 dark:text-gray-300 ${required ? 'after:content-["*"] after:ml-1 after:text-red-600' : ''}`}>
        {label}
      </label>
      {renderInput()}
    </div>
  )
}
