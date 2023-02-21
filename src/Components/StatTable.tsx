/* eslint-disable react/jsx-key */
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Game, StatEntry } from "../react-query/games";

interface Props {
  stats: Game["playerStats"];
}

export function StatTable({ stats }: Props) {
  const columnHelper = createColumnHelper<StatEntry>();
  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("Point", { header: "Point" }),
    columnHelper.accessor("Assist", { header: "Assist" }),
    columnHelper.accessor("Touch", { header: "Touch" }),
    columnHelper.accessor("D-Play", { header: "DPlay" }),
    columnHelper.accessor("T-Away", { header: "TAway" }),
    columnHelper.accessor("Drop", { header: "Drop" }),
    columnHelper.accessor("GSO", { header: "GSO" }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: stats || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <p className="stat-table stat-table-title">Game Stats</p>
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
