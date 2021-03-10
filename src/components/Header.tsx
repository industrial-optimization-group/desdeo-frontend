const Header = (props: { title: string }) => {
  return (
    <div className="header">
      <h1 className="header-content">{props.title}</h1>
    </div>
  );
};

export default Header;
