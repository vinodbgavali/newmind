$("#logoutBtn").click(async function(e){

    try {
      await axios.post(`http://localhost:3001/api/users/logout`, {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.log({error});
      
      console.log(       ('alert', error.response?.data?.message || 'Logout failed') );
    }


  // Prevent button default action
  // e.preventDefault();
  // console.log('logout pressed');

  // Swal.fire({
  //   // text: "Are you sure to Delete",
  //   // title: `${deleteCat}`,
  //   // text: "You won't be able to revert this!",
  //   icon: "warning",
  //   text: 'Are you sure you want to Sign-Out?',
  //   showCancelButton: true,
  //   confirmButtonColor: "#3085d6",
  //   cancelButtonColor: "#d33",
  //   confirmButtonText: "Yes, Sign-out!"

  // }).then(async (result) => {
  //   if (result.isConfirmed) {
  //     console.log('logout confiemd');


  //     try {
  //       await axios.post(`http://localhost:3001/api/users/logout`, {}, { withCredentials: true });
  //       window.location.href = '/login';
  //     } catch (error) {
  //       console.log(       ('alert', error.response?.data?.message || 'Logout failed') );
  //     }

  //     // try {
  //     //   const response = await fetch(`http://localhost:3001/api/users/logout`,
  //     //     {
  //     //       method: "POST",
  //     //     }).then(response => {
  //     //       if (!response.ok) {
  //     //         throw new error(`Logout Error`);
  //     //       }
  //     //       return response.json();
  //     //     }).then(data => {
  //     //      // Navigate to the home page
           
  //     //      // Replace the current history entry with the home page
  //     //      window.location.replace(`/login`);
  //     //      history.replaceState(null, null, `/login`);
  //     //       // window.location.replace(`${rootVar}/login`)


  //     //     })
  //     // } catch (error) {
  //     //   console.log(error);
  //     // }
  //   }
  //   })
  
  })