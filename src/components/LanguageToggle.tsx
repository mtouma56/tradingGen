import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/Button"

export function LanguageToggle() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const currentLang = i18n.language
    const newLang = currentLang === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(newLang)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-9 px-2 font-medium"
    >
      <Languages className="h-4 w-4 mr-1" />
      {i18n.language.toUpperCase()}
    </Button>
  )
}