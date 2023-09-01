import { useEffect, useState } from "react";
import axios from "axios";
import React from 'react';
import Mensaje from "./Alertas/Mensaje";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  usePagination,
  canPreviousPage,
  canNextPage
} from "react-table";
import { MdDeleteForever, MdNoteAdd, MdInfo } from "react-icons/md"; // Importa react-icons/md

const Tabla = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);

  const listarPacientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_BACKEND_URL}/pacientes`;
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const respuesta = await axios.get(url, options);
      setPacientes(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    listarPacientes();
  }, []);

  const handleDelete = async (id) => {
    try {
      const confirmar = window.confirm(
        "Vas a registrar la salida de un paciente, ¿Estás seguro de realizar esta acción?"
      );
      if (confirmar) {
        const token = localStorage.getItem("token");
        const url = `${import.meta.env.VITE_BACKEND_URL
          }/paciente/eliminar/${id}`;
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const data = {
          salida: new Date().toString(),
        };
        await axios.delete(url, { headers, data });
        listarPacientes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const data = React.useMemo(() => pacientes, [pacientes]);

  const columns = React.useMemo(
    () => [
      {
        Header: "N°",
        accessor: (row, index) => index + 1,
        // Puedes utilizar un accessor personalizado para la numeración
      },
      {
        Header: "Nombre",
        accessor: "nombre",
      },
      {
        Header: "Propietario",
        accessor: "propietario",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Celular",
        accessor: "celular",
      },
      {
        Header: "Estado",
        accessor: "estado",
        Cell: ({ value }) => (
          <span className={`bg-blue-100 text-green-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ${value ? 'visible' : 'invisible'}`}>
            {value ? 'activo' : ''}
          </span>
        ),
      },
      {
        Header: "Acciones",
        accessor: "acciones",
        Cell: ({ row }) => (
          <div className="py-2 text-center">
            <MdNoteAdd
              className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2"
              onClick={() =>
                navigate(`/dashboard/visualizar/${row.original._id}`)
              }
            />
            <MdInfo
              className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2"
              onClick={() =>
                navigate(`/dashboard/actualizar/${row.original._id}`)
              }
            />
            <MdDeleteForever
              className="h-7 w-7 text-red-900 cursor-pointer inline-block"
              onClick={() => {
                handleDelete(row.original._id);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
    state: { globalFilter, pageIndex, pageSize },
    page,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 10 },
    },
    useFilters,
    useGlobalFilter,
    usePagination
  );

  return (
    <div>
      {pacientes.length === 0 ? (
        <Mensaje tipo={"active"}>{"No existen registros"}</Mensaje>
      ) : (
        <>
          <input
            type="text"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
          />
          <table {...getTableProps()} className="w-full mt-5 table-auto shadow-lg bg-white">
            <thead className="bg-gray-800 text-slate-400">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} className="p-2">
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="border-b hover:bg-gray-300 text-center">
                    {row.cells.map((cell) => {
                      return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {"<<"}
            </button>{" "}
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {"<"}
            </button>{" "}
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {">"}
            </button>{" "}
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
              {">>"}
            </button>{" "}
            <span>
              Página{" "}
              <strong>
                {pageIndex + 1} de {page.length}
              </strong>
            </span>
            <span>
              | Ir a la página:{" "}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: "50px" }}
              />
            </span>{" "}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Mostrar {pageSize}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default Tabla;
