import CreepControl from "./CreepControl";
import RoomConsole from "./RoomConsole";
import RoomExtension from "./RoomExtension";
import RoomHelp from "./RoomHelp";
import assignPrototype from "@/utils/global/assignPrototype";
import mountShortcut from "@/modules/shortcut/mountShortcut";
import mountTransport from "@/modules/Task/RoomTransportTask";

export { RoomExtension, RoomConsole, RoomHelp };

/**
 * 依次挂载所有的 Room 拓展
 */
export default function mountRoom(): void {
  mountShortcut();
  mountTransport();
  assignPrototype(Room, CreepControl);
}
