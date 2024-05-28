import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button, CardActions, Menu, MenuItem, Stack } from "@mui/material";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { CustomAxiosAuth } from "../utils/CustomAxios";
import { useGlobalContext } from "../context/GlobalContext";
import BookmarkCategoryModal from "./Modals/BookmarkCategoryModal";
import { bookmark_category } from "../pages/Bookmark";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function BookmarkCategoryCard({
  bookmark_category,
}: {
  bookmark_category: bookmark_category;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user } = useGlobalContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryDelete = async () => {
    setAnchorEl(null);
    const res = await CustomAxiosAuth(user?.token as string).delete(
      "/bookmark/category/" + bookmark_category.id
    );
    if (res.data.success) {
      toast.success("Category Deleted Successfully");
      queryClient.invalidateQueries("bookmarkCategory");
    } else {
      toast.error("Error Deleting Category");
    }
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <>
            <IconButton
              aria-label="settings"
              id="demo-positioned-button"
              aria-controls={open ? "demo-positioned-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="demo-positioned-menu"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <BookmarkCategoryModal
                modalType={"edit"}
                categoryId={bookmark_category.id}
                FormValues={{
                  name: bookmark_category.name,
                  description: bookmark_category.description,
                }}
              />
              <MenuItem onClick={handleCategoryDelete}>
                <DeleteIcon /> Delete
              </MenuItem>
            </Menu>
          </>
        }
        title={bookmark_category.name}
        subheader={bookmark_category.createdAt}
      />
      <CardMedia>
        <Stack direction={"row"}>
          <img
            defaultValue={
              "https://th.bing.com/th/id/OIP.fXX3ufl2IoAOPxsewn8uHgHaE7?w=1700&h=1133&rs=1&pid=ImgDetMain"
            }
            src={
              bookmark_category.category_blog[0]?.blog.banner_img.split(
                ","
              )[0] + "-200x200.jpeg"
            }
            alt=""
            height={100}
          />
          <img
            defaultValue={
              "https://th.bing.com/th/id/OIP.fXX3ufl2IoAOPxsewn8uHgHaE7?w=1700&h=1133&rs=1&pid=ImgDetMain"
            }
            src={
              bookmark_category.category_blog[1]?.blog.banner_img.split(
                ","
              )[0] + "-200x200.jpeg"
            }
            alt=""
            height={100}
            style={{ marginLeft: "-30px" }}
          />
          <img
            defaultValue={
              "https://th.bing.com/th/id/OIP.fXX3ufl2IoAOPxsewn8uHgHaE7?w=1700&h=1133&rs=1&pid=ImgDetMain"
            }
            src={
              bookmark_category.category_blog[2]?.blog.banner_img.split(
                ","
              )[0] + "-200x200.jpeg"
            }
            alt=""
            height={100}
            style={{ marginLeft: "-30px" }}
          />
        </Stack>
      </CardMedia>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {bookmark_category.description}
        </Typography>
      </CardContent>
      <CardActions
        onClick={() => navigate("/bookmark/" + bookmark_category.id)}
      >
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}
