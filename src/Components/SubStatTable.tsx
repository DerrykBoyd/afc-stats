import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Game, SubStatEntry } from "../react-query/games";

interface Props {
  stats: Game["subStats"];
}

export function SubStatTable({ stats }: Props) {
  const columnHelper = createColumnHelper<SubStatEntry>();
  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("lastTimeIn", { header: "Last In" }),
    columnHelper.accessor("timeMMSS", { header: "Time On Field" }),
    columnHelper.accessor("shifts", { header: "Total Shifts" }),
    columnHelper.accessor("averageTimeOnMMSS", { header: "Average Time On" }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: stats || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <p className="stat-table stat-table-title">Game Stats (Subs)</p>
      <table className="stat-table">
        <thead>
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
