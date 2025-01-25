<script lang="ts">
  import X from "lucide-svelte/icons/x";
  import BadgeHelp from "lucide-svelte/icons/badge-help";
  import { isHelpModalOpen } from "./utils.js";
  import { editingText } from "./tools.js";

  let modal: HTMLDialogElement;
  const openModal = () => {
    modal.classList.remove("closing");
    modal.showModal();
    modal.classList.add("showing");
    isHelpModalOpen.set(true);
  };
  const closeModal = () => {
    if ($isHelpModalOpen) {
      modal.classList.remove("showing");
      modal.showModal();
      modal.classList.add("closing");
      modal.addEventListener(
        "animationend",
        () => {
          modal.close();
          modal.classList.remove("closing");
        },
        { once: true }
      );
      isHelpModalOpen.set(false);
    }
  };
  $effect(() => {
    editingText.subscribe((val) => {
      if (!val) {
        document.addEventListener("keydown", keyEvent);
      } else {
        document.removeEventListener("keydown", keyEvent);
      }
    });
    function keyEvent(e: KeyboardEvent) {
      e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        openModal();
      }
      if (e.key === "Escape") {
        closeModal();
      }
    }
  });
</script>

<button class="fixed bottom-4 right-4 w-12 h-12 grid place-items-center text-white bg-indigo-500 hover:bg-indigo-400 rounded-full" onclick={openModal}>
  <BadgeHelp />
</button>
<dialog bind:this={modal} class="relative p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:text-white">
  <button class="close-button" onclick={closeModal}>
    <X />
  </button>
  <h2 class="mb-4 text-lg font-semibold">Sveltedraw Shortcuts</h2>
  <table class="min-w-full table-auto border-collapse">
    <thead>
      <tr>
        <th class="px-4 py-2 border border-gray-300 text-left">Shortcut</th>
        <th class="px-4 py-2 border border-gray-300 text-left">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="px-4 py-2 border border-gray-300">Escape</td>
        <td class="px-4 py-2 border border-gray-300">
          <p>If help menu is open, closes the help menu</p>
          <p>Else, discards the currently selected tool</p>
        </td>
      </tr>
      <tr>
        <td class="px-4 py-2 border border-gray-300">Delete</td>
        <td class="px-4 py-2 border border-gray-300">Deletes the selected object(s)</td>
      </tr>
      <tr>
        <td class="px-4 py-2 border border-gray-300">Ctrl + D / Command + D</td>
        <td class="px-4 py-2 border border-gray-300">Duplicates selected object(s)</td>
      </tr>
      <tr>
        <td class="px-4 py-2 border border-gray-300">Ctrl + A / Command + A</td>
        <td class="px-4 py-2 border border-gray-300">Selects all objects</td>
      </tr>
      <tr>
        <td class="px-4 py-2 border border-gray-300">Ctrl + K / Command + K</td>
        <td class="px-4 py-2 border border-gray-300">Opens help menu</td>
      </tr>
      <tr>
        <td class="px-4 py-2 border border-gray-300">Arrow Keys</td>
        <td class="px-4 py-2 border border-gray-300">Moves selected object(s) in the respective direction</td>
      </tr>
    </tbody>
  </table>
</dialog>
