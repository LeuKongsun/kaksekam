import { EllipseMiniSolid } from "@medusajs/icons"
import { Label, RadioGroup, Text, clx } from "@modules/common/components/ui"
type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3">
      <Text className="text-small-semi uppercase tracking-[0.14em] text-ui-fg-subtle">
        {title}
      </Text>
      <RadioGroup data-testid={dataTestId} className="flex flex-col gap-2">
        {items?.map((i) => (
          <div
            key={i.value}
            className={clx("flex items-center", {
              "ml-[-6px]": i.value === value,
            })}
          >
            {i.value === value && <EllipseMiniSolid />}
            <RadioGroup.Item
              checked={i.value === value}
              onChange={() => handleChange(i.value)}
              className="hidden peer"
              id={i.value}
              value={i.value}
            />
            <Label
              htmlFor={i.value}
              className={clx(
                "ml-1 rounded-full border border-transparent px-3 py-2 text-small-regular !transform-none text-ui-fg-subtle hover:cursor-pointer",
                {
                  "border-gray-200 bg-white text-ui-fg-base shadow-sm":
                    i.value === value,
                }
              )}
              data-testid="radio-label"
              data-active={i.value === value}
            >
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
