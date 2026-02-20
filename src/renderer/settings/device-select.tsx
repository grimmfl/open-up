import {useEffect, useState} from "react";

export default function DeviceSelect(
  {
    initial,
    deviceKind,
    onSelect,
  }:
  {
    initial?: string | null,
    deviceKind: MediaDeviceKind
    onSelect?: (deviceId: string) => void
  }
) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const [selectedDeviceId, setselectedDeviceId] = useState<string | null>(initial ?? null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(allDevices => {
      const kindDevices = allDevices.filter(d => d.kind === deviceKind);

      setDevices(kindDevices);
    });
  }, []);

  function selectDevice(device: MediaDeviceInfo) {
    setselectedDeviceId(device.deviceId);

    onSelect?.(device.deviceId);
  }

  return (
    <div>
      <table className="table table-selectable">
        <thead></thead>
        <tbody>
        {devices.map(device =>
          <tr
            onClick={() => selectDevice(device)} key={device.deviceId}
            className={`cursor-pointer ${device.deviceId === selectedDeviceId ? 'table-row-selected' : ''}`}
          >
            <td>{device.label}</td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
}
