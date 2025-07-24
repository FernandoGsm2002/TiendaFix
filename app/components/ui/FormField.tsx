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
            input: "text-[#343A40] placeholder:text-[#6C757D] text-base",
            inputWrapper: "bg-[#F8F9FA] border-[#E8F0FE] hover:border-[#004085] focus-within:border-[#004085]",
            label: "text-[#343A40] font-medium text-base",
            description: "text-[#6C757D]",
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
              "bg-[#F8F9FA]",
              "border-[#E8F0FE]",
              "text-[#343A40]",
              "data-[open=true]:border-[#004085]",
              "data-[focus=true]:border-[#004085]",
              "data-[hover=true]:border-[#004085]",
              "transition-colors",
              "min-h-12"
            ].join(" "),
            value: [
              "text-[#343A40]",
              "font-medium",
              "text-base",
              hasValue ? "text-[#343A40]" : "text-[#6C757D]"
            ].join(" "),
            label: "text-[#343A40] font-medium text-base",
            description: "text-[#6C757D]",
            errorMessage: "text-red-700 font-medium",
            popoverContent: [
              "bg-[#F8F9FA]",
              "border-[#E8F0FE]",
              "shadow-lg"
            ].join(" "),
            listbox: "bg-[#F8F9FA]",
            selectorIcon: "text-[#6C757D]"
          }}
          className={className}
        >
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              className="text-[#343A40] data-[selected=true]:bg-[#E8F0FE] data-[selected=true]:text-[#343A40] data-[hover=true]:bg-[#E8F0FE] data-[focus=true]:bg-[#E8F0FE]"
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
        input: "text-[#343A40] placeholder:text-[#6C757D] text-base",
        inputWrapper: "bg-[#F8F9FA] border-[#E8F0FE] hover:border-[#004085] focus-within:border-[#004085] min-h-12",
        label: "text-[#343A40] font-medium text-base",
        description: "text-[#6C757D]",
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
      <label className={`block text-base font-medium text-[#343A40] ${required ? 'after:content-["*"] after:ml-1 after:text-red-600' : ''}`}>
        {label}
      </label>
      {renderInput()}
    </div>
  )
}
