import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";

import { IOptions } from "./interface";
import Service from "./service";

export class ServiceProvider extends Providers.ServiceProvider {
    @Container.inject(Container.Identifiers.LogService)
    private readonly logger!: Contracts.Kernel.Logger;

    private service = Symbol.for("Service<Client>");

    public async register(): Promise<void> {
        this.logger.info("[deadlock-delegate/notifier] Registering plugin");
        this.app.bind(this.service).to(Service).inSingletonScope();
    }

    public async boot(): Promise<void> {
        const options = (this.config().all() as unknown) as IOptions;
        this.app.get<Service>(this.service).listen(options);
        this.logger.info("[deadlock-delegate/notifier] Plugin started");
    }

    public async bootWhen(serviceProvider?: string): Promise<boolean> {
        return !!this.config().get("enabled") && serviceProvider === "@arkecosystem/core-blockchain";
    }

    public async dispose(): Promise<void> {
        // TODO: make sure plugin is stopped gracefully
        // this.logger.info('Stopped')
    }
}
