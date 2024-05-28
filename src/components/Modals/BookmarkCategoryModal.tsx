const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
};

interface FormValues {
  name: string;
  description: string;
}
interface Props {
  modalType: string;
  FormValues?: FormValues;
  categoryId?: string;
}

import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { CustomAxiosAuth } from "../../utils/CustomAxios";
import { useGlobalContext } from "../../context/GlobalContext";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const BookmarkCategoryModal = ({
  modalType,
  FormValues,
  categoryId,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { user } = useGlobalContext();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: FormValues?.name || "",
      description: FormValues?.description || "",
    },
  });
  const queryClient = useQueryClient();

  const handleFormSubmit = async (data: FormValues) => {
    if (modalType === "edit") {
      const res = await CustomAxiosAuth(user?.token as string).put(
        "/bookmark/category/" + categoryId,
        data
      );
      if (res.data.success) {
        queryClient.invalidateQueries("bookmarkCategory");
        toast.success("Category updated successfully");
      } else {
        setError("root", {
          type: "value",
          message: res.data.message,
        });
      }
    } else {
      const res = await CustomAxiosAuth(user?.token as string).post(
        "/bookmark/category",
        data
      );
      if (res.data.success) {
        queryClient.invalidateQueries("bookmarkCategory");
      } else {
        setError("root", {
          type: "value",
          message: res.data.message,
        });
      }
    }
    setOpen(false);
  };

  return (
    <>
      {modalType === "edit" ? (
        <MenuItem onClick={handleOpen}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
      ) : (
        <Button onClick={handleOpen} variant="outlined" endIcon={<AddIcon />}>
          Create new catgory
        </Button>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component={"form"}
          sx={style}
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 2 }}
            >
              {modalType === "edit" ? "Edit category" : "Create new category"}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            label="Name"
            id="name"
            {...register("name", {
              required: {
                value: true,
                message: "Name field is required",
              },
              maxLength: {
                value: 30,
                message: "Name cannot be more than 30 characters",
              },
            })}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Box sx={{ color: "red" }}>{errors.name?.message}</Box>
          <TextField
            label="Description"
            id="description"
            {...register("description", {
              maxLength: {
                value: 150,
                message: "Description cannot be more than 150 characters",
              },
            })}
            fullWidth
            multiline
            rows={4}
          />
          <Box sx={{ color: "red" }}>{errors.description?.message}</Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              disabled={!isDirty || isSubmitting}
              type="submit"
            >
              {modalType === "edit" ? "Update" : "Create"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default BookmarkCategoryModal;
