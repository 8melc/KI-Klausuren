'use client'

import { useState, useRef, useEffect } from 'react'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  label?: string
  className?: string
  suggestions?: (input: string) => string[]
  allowCustom?: boolean
  inputClassName?: string
}

export default function Combobox({
  value,
  onChange,
  options,
  placeholder = '',
  label,
  className,
  suggestions,
  allowCustom = true,
  inputClassName
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update input when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter options
  useEffect(() => {
    if (!isOpen || !inputValue) {
      setFilteredOptions(options.slice(0, 10))
      return
    }

    const lowerInput = inputValue.toLowerCase().trim()
    
    // Exact matches first
    const exactMatches = options.filter(opt => 
      opt.toLowerCase() === lowerInput
    )
    
    // Starts with
    const startsWith = options.filter(opt => 
      opt.toLowerCase().startsWith(lowerInput) && !exactMatches.includes(opt)
    )
    
    // Contains
    const contains = options.filter(opt => 
      opt.toLowerCase().includes(lowerInput) && 
      !exactMatches.includes(opt) && 
      !startsWith.includes(opt)
    ).slice(0, 10)

    let filtered = [...exactMatches, ...startsWith, ...contains].slice(0, 10)

    // Add custom suggestions
    if (suggestions) {
      const customSuggestions = suggestions(inputValue)
      filtered = [...filtered, ...customSuggestions.filter(s => !filtered.includes(s))].slice(0, 10)
    }

    // Add custom input if allowed and no exact match
    if (allowCustom && !exactMatches.length && inputValue.trim() && !options.includes(inputValue.trim())) {
      filtered = [inputValue.trim(), ...filtered.slice(0, 9)]
    }

    setFilteredOptions(filtered)
  }, [inputValue, options, isOpen, suggestions, allowCustom])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)
    setHighlightedIndex(-1)
    
    if (allowCustom) {
      onChange(newValue)
    }
  }

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue)
    onChange(selectedValue)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : -1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex])
      } else if (inputValue.trim() && allowCustom) {
        handleSelect(inputValue.trim())
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const baseInputClass = `w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-12 bg-white shadow-sm hover:border-blue-400 ${inputValue ? 'text-gray-900' : 'text-gray-400'}`
  const combinedInputClass = `${baseInputClass} ${inputClassName || ''}`

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <p className="text-xs font-semibold uppercase text-gray-500 mb-2">{label}</p>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={combinedInputClass}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 pointer-events-auto"
          aria-label="Dropdown öffnen"
        >
          <svg
            className="w-5 h-5 transition-transform"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const isHighlighted = index === highlightedIndex
            const isCustom = allowCustom && index === 0 && option === inputValue && !options.includes(option)
            return (
              <button
                key={`${option}-${index}`}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  isHighlighted
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${isCustom ? 'font-semibold' : ''}`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option}
                {isCustom && <span className="ml-2 text-xs text-gray-500">(neu)</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}






