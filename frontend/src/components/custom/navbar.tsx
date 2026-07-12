import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { RocketIcon } from "lucide-react";

interface Props {
    language: string,
    setLanguage: (value: string | undefined) => void;
}

const LANGUAGES = ["plaintext", "javascript", "typescript", "python", "java", "cpp", "go", "rust"];

export const Navbar = ({language, setLanguage}: Props) => {
    return (
        <div className="shrink-0 flex justify-between items-center w-full px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex justify-center items-center gap-2">
                <RocketIcon className="w-6 h-6 bg-purple-600 text-white p-1 rounded-md" />
                <p className="text-lg font-bold text-zinc-50">Code Share</p>
            </div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="bg-zinc-800 text-zinc-100 capitalize hover:bg-purple-600 hover:text-white data-[state=open]:bg-purple-600 data-[state=open]:text-white">
                            {language || "Languages"}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-40 gap-1 p-2 bg-zinc-900">
                                {LANGUAGES.map((lang) => (
                                    <li key={lang}>
                                        <NavigationMenuLink
                                            onClick={() => setLanguage(lang)}
                                            className={`cursor-pointer block select-none rounded-md px-3 py-2 text-sm capitalize text-zinc-200 hover:bg-purple-600 hover:text-white transition-colors ${
                                                language === lang ? "bg-purple-600 text-white font-semibold" : ""
                                            }`}
                                        >
                                            {lang}
                                        </NavigationMenuLink>
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}