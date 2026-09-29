import Quill from "quill";
const Parchment = Quill.import("parchment");
console.log(Object.keys(Parchment));
if (Parchment.Attributor) {
  console.log("Attributor keys:", Object.keys(Parchment.Attributor));
}
console.log("StyleAttributor exists:", !!Parchment.StyleAttributor);
