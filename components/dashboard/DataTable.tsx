import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchColumnId?: string;
  searchPlaceholder?: string;
}

export default function DataTable<TData>({
  data,
  columns,
  searchColumnId,
  searchPlaceholder = "Filter records...",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {searchColumnId && (
        <div className="relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 focus:border-brand focus:ring-[0.5px] focus:ring-brand rounded-element focus:outline-none transition-colors"
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50/70 dark:bg-slate-800/30 border-b-[0.5px] border-slate-200 dark:border-slate-800">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-4 font-heading font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " ▴",
                          desc: " ▾",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b-[0.5px] border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 text-slate-700 dark:text-slate-300 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-slate-400 font-body">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {table.getPageCount() > 1 && (
          <div className="p-4 border-t-[0.5px] border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-heading">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-element bg-gray-50 border border-slate-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <IconChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[1.8]" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-element bg-gray-50 border border-slate-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <IconChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[1.8]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
