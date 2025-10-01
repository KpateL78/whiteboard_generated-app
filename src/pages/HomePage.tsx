import { ThemeToggle } from '@/components/ThemeToggle';
import { Toolbar } from '@/components/Toolbar';
import { EdgeDrawCanvas } from '@/components/EdgeDrawCanvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { ZoomControls } from '@/components/ZoomControls';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDrawStore } from '@/store/useDrawStore';
export function HomePage() {
  const deleteSelectedElements = useDrawStore((state) => state.deleteSelectedElements);
  const duplicateSelectedElements = useDrawStore((state) => state.duplicateSelectedElements);
  const undo = useDrawStore((state) => state.undo);
  const redo = useDrawStore((state) => state.redo);
  useHotkeys('backspace, delete', (e) => {
    e.preventDefault();
    deleteSelectedElements();
  }, [deleteSelectedElements]);
  useHotkeys('mod+d', (e) => {
    e.preventDefault();
    duplicateSelectedElements();
  }, [duplicateSelectedElements]);
  useHotkeys('mod+z', (e) => {
    e.preventDefault();
    undo();
  }, [undo]);
  useHotkeys('mod+shift+z, mod+y', (e) => {
    e.preventDefault();
    redo();
  }, [redo]);
  return (
    <main className="w-screen h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Toolbar />
      <EdgeDrawCanvas />
      <PropertiesPanel />
      <ZoomControls />
      <ThemeToggle className="fixed top-4 right-4" />
      <footer className="fixed bottom-2 left-4 text-xs text-slate-400">
        Built with ❤️ at Cloudflare
      </footer>
    </main>
  );
}