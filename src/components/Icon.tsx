import * as L from "lucide-react";
export default function Icon({name,className}:{name:string;className?:string}){
  const C=(L as unknown as Record<string,React.ComponentType<{className?:string}>>)[name]||L.Wrench;
  return <C className={className}/>;
}
