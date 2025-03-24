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
    
    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label == 'healthProfiling' or obj2._meta.app_label == 'Profiling':
            return True
        elif 'Profiling' in [obj1._meta.app_label, obj2._meta.app_label]:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.router_app_labels:
            return db == 'default'
      
    
