import React, { useMemo } from "react";
import { useTable, useSortBy } from "react-table";

export default function StatTable(props) {
  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Last In", accessor: "lastTimeIn", sortDescFirst: true },
      { Header: "Time On Field", accessor: "timeMMSS", sortDescFirst: true },
      { Header: "Total Shifts", accessor: "shifts", sortDescFirst: true },
      {
        Header: "Average Time On",
        accessor: "averageTimeOnMMSS",
        sortDescFirst: true,
      },
    ],
    []
  );

  const data = useMemo(() => props.stats, [props.stats]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        data,
        columns,
      },
      useSortBy
    );

  return (
    <>
      <p className="stat-table stat-table-title">
        Game Stats - Touch headers to sort
      </p>
      <table className="stat-table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {/* Add a sort direction indicator */}
                  <span>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <i className="material-icons md-18">arrow_drop_down</i>
                      ) : (
                        <i className="material-icons md-18">arrow_drop_up</i>
                      )
                    ) : (
                      ""
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
