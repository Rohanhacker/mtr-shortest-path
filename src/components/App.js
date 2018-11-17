import React, { Component } from "react";
import _ from "lodash";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Form,
  Title,
  FormContainer,
  Input,
  Button,
  ResultContainer,
  Item,
  Icon,
  ULList,
  ListItem,
  RouteText
} from "./StyledComponents";
import DetailedRouteCard from "../components/DetailedRouteCard";
import findRoutes, { allLines as lines } from "../routing/findRoutes";
import "./App.css";

// This is only a placeholder to demonstrate the Google Maps API.
// You should reorganize and improve it.

class App extends Component {
  state = {
    source: null,
    destination: null,
    destinationText: null,
    sourceText: null,
    bestRoutes: [],
    openedRoutes: {}
  };
  componentDidMount() {
    setTimeout(() => {
      const { SearchBox } = window.google.maps.places;
      const originSearch = new SearchBox(document.getElementById("origin"));
      const destinationSearch = new SearchBox(
        document.getElementById("destination")
      );
      originSearch.addListener("places_changed", () => {
        const places = originSearch.getPlaces();
        const location = places[0].geometry.location.toJSON();
        this.setState({
          source: location,
          sourceText: places[0].name
        });
      });
      destinationSearch.addListener("places_changed", () => {
        const places = destinationSearch.getPlaces();
        const location = places[0].geometry.location.toJSON();
        this.setState({
          destination: location,
          destinationText: places[0].name
        });
      });
    }, 100);
  }

  /**
   * find routes based on source and destination coordinates
   */
  findRoutes = e => {
    e.preventDefault();
    const { destination, source } = this.state;
    if (source && destination) {
      const routes = findRoutes(source, destination);
      if (_.isEmpty(routes)) {
        toast.error("No routes found !", {
          position: toast.POSITION.TOP_CENTER
        });
        return;
      }
      this.setState({
        openedRoutes: {},
        bestRoutes: routes
      });
    }
  };

  /**
   * Add clicked card's index to openedRoutes
   */
  openDetailedRoute = i => {
    const { openedRoutes } = this.state;
    this.setState({
      openedRoutes: { ...openedRoutes, [i]: true }
    });
  };

  render() {
    const { bestRoutes, openedRoutes } = this.state;
    const isRoute = this.state.bestRoutes.length > 0;
    const ItemsDOM = bestRoutes.map((route, i) => {
      const isDetailed = openedRoutes[i];
      const startRoute = route.steps[0];
      const start = `Start by walking ${startRoute.distance} towards ${
        startRoute.to
      }`;
      if (isDetailed) {
        const endRoute = route.steps[route.steps.length - 1];
        const end = `Walk ${endRoute.distance} towards ${endRoute.to}`;
        const middleRoutesDOM = route.steps
          .filter(step => step.type === "ride")
          .map((step, j) => {
            const { line, stations } = step;
            return (
              <DetailedRouteCard
                key={`${step.from} ${j}`}
                lines={lines}
                line={line}
                step={step}
                stations={stations}
              />
            );
          });
        return (
          <Item key={i}>
            <RouteText>{start}</RouteText>
            {middleRoutesDOM}
            <RouteText>{end}</RouteText>
          </Item>
        );
      }
      const pathLines = route.steps.filter(r => r.line).map(r => r.line);
      const linesDOM = pathLines.map((line, j) => {
        return (
          <ListItem key={`${line}${i}${j}`}>
            <Icon color={lines[line].color}>{line}</Icon>
          </ListItem>
        );
      });
      return (
        <Item key={i} onClick={() => this.openDetailedRoute(i)}>
          <ULList>{linesDOM}</ULList>
          <RouteText>{start}</RouteText>
        </Item>
      );
    });
    const resultDOM = isRoute ? (
      <ResultContainer>{ItemsDOM}</ResultContainer>
    ) : null;
    return (
      <div id="app">
        <Container>
          <Title>MRT Routes Finder</Title>
          <FormContainer>
            <Form>
              <Input id="origin" placeholder="Origin" />
              <Input id="destination" placeholder="Destination" />
              <Button onClick={this.findRoutes}>Search</Button>
            </Form>
          </FormContainer>
          {isRoute ? <Title fontSize="0.8em">Suggested Routes</Title> : null}
          {resultDOM}
        </Container>
        <ToastContainer />
      </div>
    );
  }
}

export default App;
