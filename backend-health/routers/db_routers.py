class AuthRouter:
    router_app_labels = {'auth', 'contenttypes',}

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'healthProfiling':
            return 'default'
        elif model._meta.app_label == 'Profiling':
            return 'Profiling'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'healthProfiling':
            return 'default'
        elif model._meta.app_label == 'Profiling':
            return 'Profiling'
        return None
    
