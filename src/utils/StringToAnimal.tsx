import Figure from "react-bootstrap/Figure";

function StringToAnimal(name: string, figPath: string) {
  return (
    <Figure>
      <Figure.Image
        alt={`${figPath}${name}.jpg`}
        src={`${figPath}${name}.jpg`}
      />
      <Figure.Caption>{name}</Figure.Caption>
    </Figure>
  );
}

export { StringToAnimal };
