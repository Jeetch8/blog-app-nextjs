interface Props {
  commentsList: any;
  numberOfComments: number;
  blogId: string;
}

import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Avatar } from "@mui/material";
import { useGlobalContext } from "../context/GlobalContext";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation } from "@tanstack/react-query";
import { base_url } from "../utils/Constants";
import { CustomAxiosAuth } from "../utils/CustomAxios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
export default function BlogCommentsDrawer({
  commentsList,
  numberOfComments,
  blogId,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const { user } = useGlobalContext();
  const [commentInput, setCommentInput] = React.useState("");
  const date = dayjs();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setIsDrawerOpen(open);
    };

  const { mutateAsync: handleAddComment } = useMutation({
    mutationKey: ["addComment"],
    mutationFn: async () => {
      const res = await CustomAxiosAuth(user?.token as string).post(
        `${base_url}/blog/comment`,
        { value: commentInput, blogId: blogId }
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return (
    <div>
      <>
        <Button onClick={toggleDrawer(true)}>
          <ChatBubbleOutlineIcon />
          <span>{numberOfComments}</span>
        </Button>
        <Drawer
          open={isDrawerOpen}
          anchor="right"
          onClose={toggleDrawer(false)}
        >
          <Box sx={{ width: 430 }} role="presentation">
            <Box sx={{ padding: "0 20px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2>Comments</h2>
                <Button
                  color="inherit"
                  sx={{ color: "black" }}
                  onClick={toggleDrawer(false)}
                >
                  <CloseIcon />
                </Button>
              </Box>
              <Box
                sx={{
                  boxShadow:
                    "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  padding: "20px",
                  borderRadius: "5px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    mb: "10px",
                  }}
                >
                  <Avatar src={user?.profile_img} />
                  <span>{user?.name}</span>
                </Box>
                <textarea
                  onChange={(e) => setCommentInput(e.target.value)}
                  value={commentInput}
                  style={{ border: "none", outline: "none" }}
                  rows={7}
                  cols={44}
                  placeholder="What are you thoughts?"
                />
                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Button
                    sx={{ marginTop: "10px", marginLeft: "auto" }}
                    variant="contained"
                    onClick={() => handleAddComment()}
                    color="success"
                    disabled={commentInput.length === 0}
                  >
                    Comment
                  </Button>
                </Box>
              </Box>
            </Box>
            {commentsList?.map((el: any) => {
              return (
                <Box key={el.id} sx={{ padding: "20px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      mb: "10px",
                    }}
                  >
                    <Avatar src={el.user.profile_img} />
                    <span style={{ lineHeight: "3px" }}>
                      <p>{el.user.name}</p>
                      <p style={{ fontSize: "14px" }}>
                        {date.fromNow(el.createdAt)}
                      </p>
                    </span>
                  </Box>
                  <Box>
                    <p>{el.content}</p>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Drawer>
      </>
    </div>
  );
}
