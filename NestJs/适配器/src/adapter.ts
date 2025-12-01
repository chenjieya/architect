// 适配器，让他们有一个统一的接口
abstract class Adapter {
  // 实现一个说了什么的方法，参数是要说什么
  public abstract speek(name: string): void;

  // 实现一个干了什么的方法，参数是要干什么
  public abstract doSomething(thing: string): void;
}

// 正常的两个类，他们是不同的人员写的
// 1. 老板类
class Boss {
  public talk(name: string): void {
    console.log(`老板说：${name}`);
  }
  public work(thing: string): void {
    console.log(`老板做：${thing}`);
  }
}
// 2. 员工类
class Employee {
  public say(name: string): void {
    console.log(`员工说：${name}`);
  }
  public perform(thing: string): void {
    console.log(`员工做：${thing}`);
  }
}

// 适配器类
// 1. 老板的适配器
class BossAdapter extends Adapter {
  private boss: Boss;
  constructor(boss: Boss) {
    super();
    this.boss = boss;
  }
  public speek(name: string): void {
    this.boss.talk(name);
  }
  public doSomething(thing: string): void {
    this.boss.work(thing);
  }
}

// 2. 员工的适配器
class EmployeeAdapter extends Adapter {
  private employee: Employee;
  constructor(employee: Employee) {
    super();
    this.employee = employee;
  }
  public speek(name: string): void {
    this.employee.say(name);
  }
  public doSomething(thing: string): void {
    this.employee.perform(thing);
  }
}

// 客户端代码
function clientCode(adapter: Adapter) {
  adapter.speek("你好");
  adapter.doSomething("完成任务");
}
// 测试代码
const boss = new Boss();
const bossAdapter = new BossAdapter(boss);
clientCode(bossAdapter);
const employee = new Employee();
const employeeAdapter = new EmployeeAdapter(employee);
clientCode(employeeAdapter);
