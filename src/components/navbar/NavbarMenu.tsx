// import React from 'react'

// const settings = [
//     { title: 'Profile', path: '/profile' },
//     { title: 'Account', path: '/account' },
//     { title: 'Dashboard', path: '/dashboard' },
//   ];

// const NavbarMenu = () => {
//     const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
//         null
//       );
//       const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
//         null
//       );
//       const router = useRouter();
//     const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
//         setAnchorElNav(event.currentTarget);
//       };
//       const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
//         setAnchorElUser(event.currentTarget);
//       };

//       const handleCloseNavMenu = () => {
//         setAnchorElNav(null);
//       };

//       const handleCloseUserMenu = () => {
//         setAnchorElUser(null);
//       };

//       const onNavMenuOptionClick = (path: string) => {
//         router.push(path);
//         handleCloseNavMenu();
//       };

//   return (
//     <div>NavbarMenu</div>
//   )
// }

// export default NavbarMenu
