import { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper";
import { Todo } from "../model/todo.model";
import { StatusCodes } from "http-status-codes";
import { Team } from "../model/team.model";
import BadRequest from "../errors/BadRequest";
import { ITodo } from "../types/global";
import { Types } from "mongoose";

export const createTodoController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { content, team: teamId } = req.body;
    const team = await Team.findById(teamId);
    if (!team) throw new BadRequest("Team isn't found");

    const todo = await Todo.create({ content, team: teamId });

    team.unassignedTodos.push(todo);
    await team.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${team.name} created a Todo`,
      data: {
        todo: {
          content,
          _id: todo._id,
          status: todo.status,
          createdAt: todo.createdAt,
        },
      },
    });
  }
);

export const updateTodoController = asyncWrapper(
  async (req: Request, res: Response) => {
    const todoId = req.params.id;
    const { content } = req.body;

    const response = await Todo.findByIdAndUpdate(todoId, { content });
    if (!response) throw new BadRequest("Invalid todo id to update Todo");
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${response._id} todo updated`,
      data: {},
    });
  }
);
export const removeTodoController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { todoId, teamId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) throw new BadRequest("Invalid team id to delete todo");

    const response = await Todo.findByIdAndDelete(todoId);
    if (!response) throw new BadRequest("Invalid todo id to delete Todo");

    // Remove the todo from unassignedTodos
    team.unassignedTodos = team.unassignedTodos.filter(
      (todo) => todo._id.toString() !== todoId.toString()
    ) as Types.DocumentArray<ITodo>;

    // Remove the todo from each member's todos
    team.members.forEach((member) => {
      member.todos = member.todos.filter(
        (todo) => todo._id.toString() !== todoId.toString()
      ) as Types.DocumentArray<ITodo>;
    });

    // Save the updated team document
    await team.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${response._id} todo deleted`,
      data: {},
    });
  }
);
