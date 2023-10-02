import { Request, Response, Router } from 'express';

import * as packageJson from '../../../package.json';

export class HealthCheckController {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', (_request: Request, response: Response) => {
      return response.status(200).json(packageJson.description);
    });
  }
}
