import { ReactNode, useState, useCallback, createContext } from 'react';

/**
 * The purpose of the ParticipantProvider component is to ensure that the hooks useGalleryViewParticipants
 * and useSpeakerViewParticipants are not unmounted as users switch between Gallery View and Speaker View.
 * This will make sure that the ordering of the participants on the screen will remain so that the most
 * recent dominant speakers are always at the front of the list.
 */

export interface IPiPContext {
  isPiPSupported: boolean;
  pipWindow: Window | null;
  //requestPipWindow: (width: number, height: number) => Promise<void>;
  //closePipWindow:() => void;
}

export const PiPContext = createContext<IPiPContext>(null!);

interface PiPProviderProps {
  children: ReactNode;
}

export function PiPProvider({ children }: PiPProviderProps) {
  //export const PiPProvider: React.FC = ({ children }) => {
  const isPiPSupported = 'documentPictureInPicture' in window;

  // Expose pipWindow that is currently active
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [yes, setYes] = useState<boolean>(true);
  const [no, setNo] = useState<boolean>(false);

  // Close pipWidnow programmatically
  const closePipWindow = useCallback(() => {
    if (pipWindow != null) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  // Open new pipWindow
  /*const requestPipWindow = useCallback(
    async (width: number, height: number) => {
      // We don't want to allow multiple requests.
      if (pipWindow != null) {
        return;
      }

      const pip = await window.documentPictureInPicture.requestWindow({
        width,
        height,
      });

      // Detect when window is closed by user
      pip.addEventListener("pagehide", () => {
        setPipWindow(null);
      });

      // It is important to copy all parent widnow styles. Otherwise, there would be no CSS available at all
      // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/#copy-style-sheets-to-the-picture-in-picture-window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules]
            .map((rule) => rule.cssText)
            .join("");
          const style = document.createElement("style");

          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement("link");
          if (styleSheet.href == null) {
            return;
          }

          link.rel = "stylesheet";
          link.type = styleSheet.type;
          link.media = styleSheet.media.toString();
          link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

      setPipWindow(pip);
    },
    [pipWindow]
  );


      console.log(isPiPSupported,
        pipWindow,
        requestPipWindow,
        closePipWindow,
      yes,no);*/

  return (
    <PiPContext.Provider
      value={{
        isPiPSupported,
        pipWindow,
        //requestPipWindow,
        //closePipWindow
      }}
    >
      {children}
    </PiPContext.Provider>
  );
}

/*import  React, { ReactNode, useState, useCallback, useRef, createContext, useMemo, useContext } from 'react';

export interface IPiPContext {
  isPiPSupported:boolean;
  pipWindow: Window | null;
  requestPipWindow: (width: number, height: number) => Promise<void>;
  closePipWindow:() => void;
};

export const PiPContext = createContext<IPiPContext>(null!);



export const PiPProvider: React.FC = ({ children }) => {

  const isPiPSupported = "documentPictureInPicture" in window;

  // Expose pipWindow that is currently active
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [yes, setYes] = useState<boolean>(true);
  const [no, setNo] = useState<boolean>(false);

  // Close pipWidnow programmatically
  const closePipWindow = useCallback(() => {
    if (pipWindow != null) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  // Open new pipWindow
  const requestPipWindow = useCallback(
    async (width: number, height: number) => {
      // We don't want to allow multiple requests.
      if (pipWindow != null) {
        return;
      }

      const pip = await window.documentPictureInPicture.requestWindow({
        width,
        height,
      });

      // Detect when window is closed by user
      pip.addEventListener("pagehide", () => {
        setPipWindow(null);
      });

      // It is important to copy all parent widnow styles. Otherwise, there would be no CSS available at all
      // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/#copy-style-sheets-to-the-picture-in-picture-window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules]
            .map((rule) => rule.cssText)
            .join("");
          const style = document.createElement("style");

          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement("link");
          if (styleSheet.href == null) {
            return;
          }

          link.rel = "stylesheet";
          link.type = styleSheet.type;
          link.media = styleSheet.media.toString();
          link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

      setPipWindow(pip);
    },
    [pipWindow]
  );


      console.log(isPiPSupported,
        pipWindow,
        requestPipWindow,
        closePipWindow,
      yes,no);

  return (<PiPContext.Provider value={{isPiPSupported, pipWindow, requestPipWindow, closePipWindow}}>{children}</PiPContext.Provider>);
}*/
