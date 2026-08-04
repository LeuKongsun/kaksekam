import { Label } from "@modules/common/components/ui"
import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
  labelPosition?: "floating" | "top"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      name,
      label,
      touched: _touched,
      required,
      topLabel,
      labelPosition = "floating",
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const inputId = props.id ?? name
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex w-full flex-col">
        {topLabel && (
          <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
        )}
        {labelPosition === "top" && (
          <Label
            htmlFor={inputId}
            className="mb-2 text-small-semi text-ui-fg-base"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </Label>
        )}
        <div className="relative z-0 flex w-full txt-compact-medium">
          <input
            id={inputId}
            type={inputType}
            name={name}
            placeholder=" "
            required={required}
            className={`mt-0 block h-11 w-full appearance-none rounded-md border border-ui-border-base bg-ui-bg-field px-4 focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active hover:bg-ui-bg-field-hover ${
              labelPosition === "top" ? "py-2.5" : "pb-1 pt-4"
            }`}
            {...props}
            ref={inputRef}
          />
          {labelPosition === "floating" && (
            <label
              htmlFor={inputId}
              onClick={() => inputRef.current?.focus()}
              className="absolute top-3 -z-1 mx-3 flex origin-0 items-center justify-center px-1 text-ui-fg-subtle transition-all duration-300"
            >
              {label}
              {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ui-fg-subtle px-4 focus:outline-none transition-all duration-150 outline-none focus:text-ui-fg-base absolute right-0 top-3"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
