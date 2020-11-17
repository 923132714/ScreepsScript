import ObserverConsole from "./ObserverConsole";
import ObserverExtension from "./ObserverExtension";
import ObserverHelp from "./ObserverHelp";
import assignPrototype from "utils/global/assignPrototype";

// 定义好挂载顺序
const plugins = [ObserverExtension, ObserverConsole, ObserverHelp];

/**
 * 依次挂载所有拓展
 */
export default function mountObserver(): void {
  plugins.forEach(plugin => assignPrototype(StructureObserver, plugin));
}
