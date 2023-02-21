interface Props {
  serviceWorkerReg: ServiceWorkerRegistration;
}

export default function ServiceWorkerToast({ serviceWorkerReg }: Props) {
  const updateServiceWorker = () => {
    const registrationWaiting = serviceWorkerReg.waiting;
    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: "SKIP_WAITING" });
      registrationWaiting.addEventListener("statechange", (e) => {
        if ((e.target as any)?.state === "activated") {
          localStorage.setItem("serviceWorkerUpdated", "true");
          window.location.reload();
        }
      });
    }
  };

  return (
    <div className="sw-toast">
      <h4>New version available</h4>
      <button
        className="btn"
        onClick={() => {
          updateServiceWorker();
        }}
      >
        Update
      </button>
    </div>
  );
}
