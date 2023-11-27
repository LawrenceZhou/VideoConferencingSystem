import { createPortal } from 'react-dom';

type PiPWindowProps = {
  pipWindow: Window | null;
  children: React.ReactNode;
};

export default function PiPWindow({ pipWindow, children }: PiPWindowProps) {
  return createPortal(children, pipWindow!.document.body);
}
