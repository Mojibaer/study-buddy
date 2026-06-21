import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from 'study-buddy';

export function ModuleFilter() {
  return (
    <div style={{ width: 280 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Filter by module" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Semester 2</SelectLabel>
            <SelectItem value="math-2">Math 2</SelectItem>
            <SelectItem value="physics-1">Physics 1</SelectItem>
            <SelectItem value="programming-2">Programming 2</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Semester 3</SelectLabel>
            <SelectItem value="discrete-math">Discrete Math</SelectItem>
            <SelectItem value="databases">Databases</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Selected() {
  return (
    <div style={{ width: 280 }}>
      <Select defaultValue="physics-1">
        <SelectTrigger>
          <SelectValue placeholder="Filter by module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="math-2">Math 2</SelectItem>
          <SelectItem value="physics-1">Physics 1</SelectItem>
          <SelectItem value="programming-2">Programming 2</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
