const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

import { Box, Button, Modal, Typography } from "@mui/material";
import React from "react";

const EmailSent = ({ email }: { email: string }) => {
  return (
    <>
      <Modal
        open={true}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Email sent Successfully
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            An email has been sent to your email address ({email}). Please click
            on the link to verify your email address.
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default EmailSent;
