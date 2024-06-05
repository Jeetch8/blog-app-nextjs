import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { IStatsPerBlog } from "../pages/UserStats";

export default function BasicTable({
  StatsPerBlog,
}: {
  StatsPerBlog: IStatsPerBlog[] | undefined;
}) {
  if (!StatsPerBlog) return null;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: "16px" }}>
              Blog title
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "16px" }} align="right">
              Total views
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "16px" }} align="right">
              Total likes
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "16px" }} align="right">
              Total comments
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {StatsPerBlog.map((row) => (
            <TableRow
              key={row.blogId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell align="right">{row.total_number_of_views}</TableCell>
              <TableCell align="right">{row.total_number_of_likes}</TableCell>
              <TableCell align="right">
                {row.total_number_of_comments}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
