import { Text } from "@medusajs/ui"

import Elyxm from "@modules/common/icons/elyxm"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center justify-center">
      Powered by
      <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
        <Elyxm fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
    </Text>
  )
}

export default MedusaCTA
