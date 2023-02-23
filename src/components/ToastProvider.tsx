import { useState, ReactElement, createContext, useContext } from "react";
import { ToastContainer } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";

let key = 0;

type ToastContextType = (message: string) => void;
export const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export default function ToastProvider(props: { children: JSX.Element }) {
  const [toasts, setToast] = useState<ReactElement[]>([]);

  function remove(key: string) {
    setToast((oldToasts) => {
      return oldToasts.filter((toast) => key !== toast.key);
    });
  }

  function add(message: string) {
    const tempKey = key;
    const toast = (
      <Toast
        key={tempKey}
        onClose={() => {
          remove(tempKey.toString());
        }}
        autohide
        delay={5000}
      >
        <Toast.Header>
          <strong className="me-auto">Alert</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    );

    setToast((oldvalue) => [toast, ...oldvalue]);
    key++;
  }

  return (
    <ToastContext.Provider value={add}>
      {props.children}
      <ToastContainer position={"top-end"} className="m-3">
        {toasts}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
