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
            input: "text-[#013237] placeholder:text-[#4ca771] text-base",
            inputWrapper: "bg-[#f0fdf9] border-[#c0e6ba] hover:border-[#4ca771] focus-within:border-[#4ca771]",
            label: "text-[#013237] font-medium text-base",
            description: "text-[#4ca771]",
            errorMessage: "text-red-700 font-medium"
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
          classNames={{
            trigger: [
              "bg-[#f0fdf9]",
              "border-[#c0e6ba]",
              "text-[#013237]",
              "data-[open=true]:border-[#4ca771]",
              "data-[focus=true]:border-[#4ca771]",
              "data-[hover=true]:border-[#4ca771]",
              "transition-colors",
              "min-h-12"
            ].join(" "),
            value: [
              "text-[#013237]",
              "font-medium",
              "text-base",
              hasValue ? "text-[#013237]" : "text-[#4ca771]"
            ].join(" "),
            label: "text-[#013237] font-medium text-base",
            description: "text-[#4ca771]",
            errorMessage: "text-red-700 font-medium",
            popoverContent: [
              "bg-[#f0fdf9]",
              "border-[#c0e6ba]",
              "shadow-lg"
            ].join(" "),
            listbox: "bg-[#f0fdf9]",
            selectorIcon: "text-[#4ca771]"
          }}
          className={className}
        >
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              className="text-[#013237] data-[selected=true]:bg-[#eafae7] data-[selected=true]:text-[#013237] data-[hover=true]:bg-[#eafae7] data-[focus=true]:bg-[#eafae7]"
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
        input: "text-[#013237] placeholder:text-[#4ca771] text-base",
        inputWrapper: "bg-[#f0fdf9] border-[#c0e6ba] hover:border-[#4ca771] focus-within:border-[#4ca771] min-h-12",
        label: "text-[#013237] font-medium text-base",
        description: "text-[#4ca771]",
        errorMessage: "text-red-700 font-medium"
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
      <label className={`block text-base font-medium text-[#013237] ${required ? 'after:content-["*"] after:ml-1 after:text-red-600' : ''}`}>
        {label}
      </label>
      {renderInput()}
    </div>
  )
}
