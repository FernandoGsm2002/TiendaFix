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
          classNames={{
            input: "text-gray-900",
            label: "text-gray-800 font-medium",
            description: "text-gray-600",
            errorMessage: "text-red-700 font-medium"
          }}
          className={className}
        />
      )
    }

    if (type === 'select' && options.length > 0) {
      return (
        <Select
          name={name}
          selectedKeys={value ? [String(value)] : []}
          onSelectionChange={(keys) => {
            const selectedValue = Array.from(keys)[0] as string
            onChange(selectedValue || '')
          }}
          placeholder={placeholder}
          isRequired={required}
          isDisabled={disabled}
          isInvalid={!!error}
          errorMessage={error}
          description={helpText}
          variant="bordered"
          classNames={{
            trigger: "border-gray-300 text-gray-900",
            value: "text-gray-900 font-medium",
            label: "text-gray-800 font-medium",
            description: "text-gray-600",
            errorMessage: "text-red-700 font-medium"
          }}
          className={className}
        >
          {options.map((option) => (
            <SelectItem key={option.value} className="text-gray-900">
              {option.label}
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
      variant: "bordered" as const,
      classNames: {
        input: "text-gray-900 placeholder:text-gray-400",
        label: "text-gray-800 font-medium",
        description: "text-gray-600",
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
    <div className="space-y-1">
      <label className={`block text-sm ${formColors.label} ${required ? formColors.labelRequired : ''}`}>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  )
}
