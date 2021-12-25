import { DataSet, Network } from "vis-network";
import { DomainProblem } from "./domainProblem.model";

export interface MyNetwork {
    id: string,
    network?: Network,
    nodes?: DataSet<DomainProblem>,
    edges?: DataSet<{ id: string, from: string, to: string, arrows: 'to' }>
}