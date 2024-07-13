const getHttps = async () => {
    try {
      const response = await fetch("https://randomuser.me/api", {});
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const data = getHttps();
    console.log(data);
