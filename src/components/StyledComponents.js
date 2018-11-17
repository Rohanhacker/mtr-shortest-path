import styled from "styled-components";

export const Container = styled.div`
  width: 400px;
  min-height: 400px;
  background: #f1f1f1;
  margin: auto;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10%;
  box-sizing: border-box;
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  font-size: ${props => props.fontSize || "1em"};
  color: #676666;
  font-weight: 600;
`;

export const FormContainer = styled.div`
  padding: 12px;
  margin: 12px auto;
  margin-top: 10px;
  border-radius: 4px;
  background: white;
`;

export const Input = styled.input`
  padding: 8px;
  margin-top: 10px;
  border: solid 1px #ccc;
  border-radius: 4px;
  font-size: 0.8em;
`;

export const Button = styled.button`
  display: block;
  margin-left: auto;
  margin-right: 0;
  margin-top: 10px;
  color: #676666;
  font-size: 0.8em;
  padding: 8px 20px;
  background: #f1f1f1;
  border-color: #d8d8d8;
  border-radius: 4px;
  &:active {
    border-style: solid;
    background: #e0dfdf;
    cursor: pointer;
  }
  &:focus {
    outline: none;
    cursor: pointer;
  }
`;

export const ResultContainer = styled.div`
  overflow-y: auto;
  margin-top: 12px;
  height: 200px;
  border-radius: 4px;
`;

export const Item = styled.div`
  background: white;
  padding: 8px;
  min-height: 60px;
  border-bottom: 1px solid #dadada;
  cursor: pointer;
  &:hover {
    background: #e2f7ff;
  }
`;

export const Icon = styled.span`
  background: ${props => props.color};
  color: white;
  text-align: center;
  padding: 4px;
  font-size: 0.8em;
  border-radius: 4px;
`;

export const ULList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin: 8px 0;
  padding: 0;
  li:nth-of-type(1) {
    list-style-type: none;
  }
`;

export const ListItem = styled.li`
  margin-right: 24px;
  margin-bottom: 12px;
`;

export const RouteText = styled.span`
  color: #a2a2a2;
  font-size: 0.8em;
`;

export const DetailedListItem = styled.div`
  margin: 12px 4px;
`;

export const DetailedRoute = styled.span`
  margin: 8px;
  font-size: 0.8em;
`;
