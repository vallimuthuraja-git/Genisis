import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Handle, Position } from "@xyflow/react";

export default function StateNode({ data }) {
  return (
    <div className={`state-node ${data.status || "idle"}`}>
      <Handle type="target" position={Position.Left} />
      <div className="state-title">{data.label}</div>
      <div className="state-meta"><CheckCircleOutlineRoundedIcon /> {(data.identifiers || []).length} identifiers</div>
      <div className="state-meta"><BoltRoundedIcon /> {(data.actions || []).length} actions</div>
      <div className="state-meta"><DownloadRoundedIcon /> {(data.scrapers || []).length} scrapers</div>
      <div className="state-meta"><ArrowForwardRoundedIcon /> {data.next || "End"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
